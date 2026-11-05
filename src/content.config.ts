import { defineCollection, z } from 'astro:content';

const showcaseCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      ogImage: z.union([image(), z.string()]).optional(),
      categories: z.array(z.enum(["civil-drainage", "plumbing"])).min(1),
      status: z.enum(["draft", "publish"]).default("draft"),
      shortDescription: z.string(),
      heroTitle: z.string().optional(),
      image: z.union([image(), z.string()]),
      clientLabel: z.string().optional(),
      client: z.string().optional(),
      location: z.string().optional(),
      completionDate: z.string().optional(),
      projectType: z.string().optional(),
      proPlumbServices: z.string().optional(),
      description: z.string(),
      featured: z.boolean().default(false),
      gallery: z.array(z.union([image(), z.string()])).optional(),
      featureSection: z
        .object({
          delivery: z.object({
            title: z.string(),
            boldWords: z.array(z.string()).optional(),
            body: z.array(z.string()).min(1),
            image: z.union([image(), z.string()]),
            imageAlt: z.string().optional(),
          }),
          outcome: z.object({
            title: z.string(),
            boldWords: z.array(z.string()).optional(),
            body: z.array(z.string()).min(1),
            image: z.union([image(), z.string()]),
            imageAlt: z.string().optional(),
          }),
        })
        .optional(),
      scopeOfWorks: z
        .object({
          title: z.string().default("Scope\nOf Works"),
          boldWords: z.array(z.string()).optional(),
          items: z
            .array(
              z.object({
                title: z.string(),
                description: z.string(),
              })
            )
            .min(1),
        })
        .optional(),
      disciplines: z
        .array(
          z.object({
            title: z.string(),
            description: z.string(),
          })
        )
        .optional(),
      testimonial: z
        .object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
        })
        .optional(),
    }),
});

const careersCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      ogImage: z.union([image(), z.string()]).optional(),
      department: z.string(),
      location: z.string(),
      employmentType: z.string(),
      experience: z.string().optional(),
      summary: z.string(),
      order: z.number().default(999),
      featured: z.boolean().default(false),
      applyUrl: z.string().optional(),
      heroImage: z.union([image(), z.string()]).optional(),
    }),
});

export const collections = {
  showcase: showcaseCollection,
  careers: careersCollection,
};
