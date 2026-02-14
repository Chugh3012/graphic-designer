"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema } from "@/lib/validations";
import { submitContactForm } from "@/lib/actions";
import type { z } from "zod";

type ContactFormData = z.infer<typeof contactFormSchema>;

const projectTypeOptions = [
  { value: "", label: "Select a project type" },
  { value: "branding", label: "Branding" },
  { value: "packaging", label: "Packaging" },
  { value: "print-design", label: "Print Design" },
  { value: "brand-identity", label: "Brand Identity" },
  { value: "other", label: "Other" },
];

const budgetRangeOptions = [
  { value: "", label: "Select a budget range" },
  { value: "under-2k", label: "Under $2k" },
  { value: "2k-5k", label: "$2k - $5k" },
  { value: "5k-10k", label: "$5k - $10k" },
  { value: "10k-plus", label: "$10k+" },
  { value: "not-sure", label: "Not Sure" },
];

export function ContactForm() {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  async function onSubmit(data: ContactFormData) {
    try {
      setSubmitStatus("idle");
      const result = await submitContactForm(data);
      if (result.success) {
        setSubmitStatus("success");
        reset();
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    }
  }

  const inputClasses =
    "w-full bg-cream border border-stone-light/40 rounded-sm px-4 py-3 font-sans text-sm text-charcoal placeholder:text-stone-light focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors";

  const labelClasses =
    "block font-sans text-xs tracking-widest uppercase text-stone mb-2";

  const errorClasses = "mt-1.5 font-sans text-xs text-red-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* Honeypot field - hidden from real users */}
      <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className={labelClasses}>
          Name
        </label>
        <input
          type="text"
          id="name"
          placeholder="Your name"
          className={inputClasses}
          {...register("name")}
        />
        {errors.name && (
          <p className={errorClasses}>{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClasses}>
          Email
        </label>
        <input
          type="email"
          id="email"
          placeholder="your@email.com"
          className={inputClasses}
          {...register("email")}
        />
        {errors.email && (
          <p className={errorClasses}>{errors.email.message}</p>
        )}
      </div>

      {/* Two Column: Project Type & Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Project Type */}
        <div>
          <label htmlFor="projectType" className={labelClasses}>
            Project Type
          </label>
          <select
            id="projectType"
            className={inputClasses}
            {...register("projectType")}
          >
            {projectTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.projectType && (
            <p className={errorClasses}>{errors.projectType.message}</p>
          )}
        </div>

        {/* Budget Range */}
        <div>
          <label htmlFor="budgetRange" className={labelClasses}>
            Budget Range
          </label>
          <select
            id="budgetRange"
            className={inputClasses}
            {...register("budgetRange")}
          >
            {budgetRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.budgetRange && (
            <p className={errorClasses}>{errors.budgetRange.message}</p>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className={labelClasses}>
          Message
        </label>
        <textarea
          id="message"
          rows={6}
          placeholder="Tell me about your project..."
          className={`${inputClasses} resize-none`}
          {...register("message")}
        />
        {errors.message && (
          <p className={errorClasses}>{errors.message.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`inline-flex items-center justify-center font-sans text-sm tracking-widest uppercase px-10 py-4 rounded-sm transition-all duration-300 ${
          isSubmitting
            ? "bg-stone-light text-cream cursor-not-allowed"
            : "bg-accent text-cream hover:bg-accent-hover"
        }`}
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-4 w-4 text-cream"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </button>

      {/* Success Message */}
      {submitStatus === "success" && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-sm">
          <p className="font-sans text-sm text-green-800">
            Thank you for your message! I&apos;ll get back to you within 1-2
            business days.
          </p>
        </div>
      )}

      {/* Error Message */}
      {submitStatus === "error" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-sm">
          <p className="font-sans text-sm text-red-800">
            Something went wrong. Please try again or email me directly.
          </p>
        </div>
      )}
    </form>
  );
}
