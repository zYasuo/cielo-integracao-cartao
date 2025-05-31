import z from "zod";
import { EIdentificationType } from "@/types/enums.types";

export const SCustomerSchema = z.object({
  Name: z.string().min(1, "Name is required"),
  Identity: z
    .string()
    .min(1, "Identity is required")
    .max(14, "Identity must be at most 14 characters long")
    .regex(/^\d+$/, "Identity must contain only digits"),
  IdentityType: z.enum([EIdentificationType.CPF, EIdentificationType.CNPJ], {
    errorMap: () => ({ message: "Invalid Identity Type" }),
  }),
  Email: z.string().email("Invalid email format").optional(),
  BirthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "BirthDate must be in format YYYY-MM-DD"),
});

export type TCustomerData = z.infer<typeof SCustomerSchema>;
