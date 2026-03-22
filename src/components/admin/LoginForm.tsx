"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/admin";
import type { AdminFormState } from "@/app/actions/admin";

const initialState: AdminFormState = {
  success: false,
  message: "",
  errors: {},
};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && !state.success && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="secret" className="block text-sm font-medium text-neutral-700 mb-1">
          Admin Secret
        </label>
        <input
          type="password"
          id="secret"
          name="secret"
          required
          autoFocus
          className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Enter admin secret..."
        />
        {state.errors.secret && (
          <p className="mt-1 text-sm text-red-600">{state.errors.secret}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-neutral-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
