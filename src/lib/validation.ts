import { z } from "zod";

export const budgetRanges = ["<$5,000", "$5,000 - $10,000", "$10,000 - $25,000", "$25,000+"] as const;

export const LeadSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(100, { message: "Name must be less than 100 characters." })
    .trim(),
  email: z
    .string()
    .email({ message: "Invalid email address." })
    .toLowerCase()
    .trim(),
  budget: z.enum(budgetRanges, {
    message: "Please select a valid budget range.",
  }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." })
    .max(1000, { message: "Message must be less than 1000 characters." })
    .trim(),
});

export type LeadInput = z.infer<typeof LeadSchema>;

export const LoginSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address." })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .trim(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
