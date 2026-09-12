import type { Instrumentation } from "next";
import { installRuntimeLogger, writeRuntimeError } from "@/lib/server/runtime-logger";

export function register() {
	if (process.env.NEXT_RUNTIME !== "edge") {
		installRuntimeLogger();
	}
}

export const onRequestError: Instrumentation.onRequestError = async (
	error,
	request,
) => {
	if (process.env.NEXT_RUNTIME !== "edge") {
		writeRuntimeError(error, request.path);
	}
};
