type FieldElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

type FieldRule = {
  eventName?: "input" | "change";
  validate: (field: FieldElement) => string;
};

type StatusContent = {
  kicker: string;
  title: string;
  message: string;
};

type StatusModalController = {
  close: () => void;
  open: (options: { success: boolean; content: StatusContent }) => void;
};

type AsyncFormConfig = {
  endpoint: string;
  errorState: StatusContent;
  fieldRules: Record<string, FieldRule>;
  form: HTMLFormElement;
  modal: StatusModalController;
  payloadType?: "json" | "form-data";
  sendingText?: string;
  submitButton: HTMLButtonElement;
  submitText?: string;
  successState: StatusContent;
  onSuccess?: () => void;
  onAfterReset?: () => void;
};

const successIconMarkup =
  '<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"></path>';
const errorIconMarkup =
  '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v5"></path><path stroke-linecap="round" stroke-linejoin="round" d="M12 16h.01"></path><path stroke-linecap="round" stroke-linejoin="round" d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path>';

const isFieldElement = (field: unknown): field is FieldElement =>
  field instanceof HTMLInputElement ||
  field instanceof HTMLSelectElement ||
  field instanceof HTMLTextAreaElement;

const parseJsonSafely = async (response: Response) => {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
};

export const createStatusModal = (
  root: ParentNode = document,
): StatusModalController => {
  const modal = root.querySelector("[data-status-modal]");
  const closeButton = root.querySelector("[data-close-modal]");
  const statusKicker = root.querySelector("[data-status-kicker]");
  const statusTitle = root.querySelector("[data-status-title]");
  const statusMessage = root.querySelector("[data-status-message]");
  const statusIcon = root.querySelector("[data-status-icon]");
  const statusIconWrap = root.querySelector("[data-status-icon-wrap]");

  const close = () => {
    if (!(modal instanceof HTMLElement)) return;

    modal.classList.add("opacity-0", "pointer-events-none");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");
  };

  const open = ({
    success,
    content,
  }: {
    success: boolean;
    content: StatusContent;
  }) => {
    if (
      !(modal instanceof HTMLElement) ||
      !(statusKicker instanceof HTMLElement) ||
      !(statusTitle instanceof HTMLElement) ||
      !(statusMessage instanceof HTMLElement) ||
      !(statusIcon instanceof SVGElement) ||
      !(statusIconWrap instanceof HTMLElement)
    ) {
      return;
    }

    statusKicker.textContent = content.kicker;
    statusTitle.textContent = content.title;
    statusMessage.textContent = content.message;

    statusTitle.classList.toggle("text-[#DFF8D7]", success);
    statusTitle.classList.toggle("text-[#FF8E8E]", !success);
    statusIconWrap.classList.toggle("text-[#DFF8D7]", success);
    statusIconWrap.classList.toggle("text-[#FF8E8E]", !success);
    statusIcon.innerHTML = success ? successIconMarkup : errorIconMarkup;

    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");
  };

  closeButton?.addEventListener("click", close);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      close();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
    }
  });

  return { close, open };
};

export const setupAsyncForm = ({
  endpoint,
  errorState,
  fieldRules,
  form,
  modal,
  onAfterReset,
  onSuccess,
  payloadType = "json",
  sendingText = "Sending...",
  submitButton,
  submitText = "Submit",
  successState,
}: AsyncFormConfig) => {
  const fields = Object.fromEntries(
    Object.keys(fieldRules).map((name) => [name, form.elements.namedItem(name)]),
  );

  const getErrorNode = (name: string) =>
    form.querySelector(`[data-error-for="${name}"]`);

  const getErrorTarget = (name: string) =>
    form.querySelector(`[data-error-target-for="${name}"]`) || fields[name];

  const setFieldError = (name: string, message: string) => {
    const errorNode = getErrorNode(name);
    const errorTarget = getErrorTarget(name);

    if (errorNode instanceof HTMLElement) {
      errorNode.textContent = message;
    }

    if (errorTarget instanceof HTMLElement) {
      errorTarget.classList.toggle("border-[#FF8E8E]", Boolean(message));
      errorTarget.classList.toggle("focus:ring-[#FF8E8E]", Boolean(message));
      errorTarget.classList.toggle("border-transparent", !message);
    }
  };

  const validateField = (name: string) => {
    const field = fields[name];

    if (!isFieldElement(field)) return true;

    const message = fieldRules[name].validate(field);
    setFieldError(name, message);
    return !message;
  };

  const validateForm = () =>
    Object.keys(fieldRules).every((fieldName) => validateField(fieldName));

  const clearErrors = () => {
    Object.keys(fieldRules).forEach((fieldName) => setFieldError(fieldName, ""));
  };

  Object.entries(fieldRules).forEach(([name, rule]) => {
    const field = fields[name];
    if (!isFieldElement(field)) return;

    const eventName = rule.eventName || (field instanceof HTMLSelectElement ? "change" : "input");
    field.addEventListener(eventName, () => validateField(name));
    field.addEventListener("blur", () => validateField(name));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    submitButton.disabled = true;
    submitButton.textContent = sendingText;

    const formData = new FormData(form);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers:
          payloadType === "json"
            ? {
                "Content-Type": "application/json",
                Accept: "application/json",
              }
            : {
                Accept: "application/json",
              },
        body:
          payloadType === "json"
            ? JSON.stringify(Object.fromEntries(formData.entries()))
            : formData,
      });

      const result = await parseJsonSafely(response);

      if (!response.ok) {
        if (result.errors && typeof result.errors === "object") {
          Object.entries(result.errors).forEach(([name, message]) => {
            if (typeof message === "string" && name in fieldRules) {
              setFieldError(name, message);
            }
          });
        }

        modal.open({
          success: false,
          content: {
            ...errorState,
            message:
              typeof result.message === "string" && result.message
                ? result.message
                : errorState.message,
          },
        });
        return;
      }

      form.reset();
      clearErrors();
      onAfterReset?.();
      onSuccess?.();

      modal.open({
        success: true,
        content: {
          ...successState,
          message:
            typeof result.message === "string" && result.message
              ? result.message
              : successState.message,
        },
      });
    } catch {
      modal.open({
        success: false,
        content: errorState,
      });
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = submitText;
    }
  });

  return {
    clearErrors,
    setFieldError,
    validateField,
    validateForm,
  };
};
