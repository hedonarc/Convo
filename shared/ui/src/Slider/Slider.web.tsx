import { cn } from "@shared/utils";
import * as React from "react";

export interface SliderProps
  extends Omit<React.ComponentPropsWithRef<"input">, "type"> {}

/**
 * Native range input with Convo's brand thumb + track styling. Uses Tailwind v4
 * arbitrary variants to target the WebKit / Firefox pseudo-elements so the
 * thumb is actually visible and grabbable (the default `appearance-none` trick
 * hides the WebKit thumb entirely).
 */
const Slider = ({ className, ...props }: SliderProps) => (
  <input
    type="range"
    className={cn(
      // Input box height matches the thumb so it doesn't get clipped.
      "h-4 w-full cursor-pointer appearance-none bg-transparent",
      "focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",

      // WebKit track
      "[&::-webkit-slider-runnable-track]:bg-border [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:w-full [&::-webkit-slider-runnable-track]:rounded-full",

      // WebKit thumb — offset upward so it centers over the slim track.
      "[&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95 [&::-webkit-slider-thumb]:active:cursor-grabbing",
      "focus-visible:[&::-webkit-slider-thumb]:scale-110",

      // Firefox track
      "[&::-moz-range-track]:bg-border [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:w-full [&::-moz-range-track]:rounded-full",

      // Firefox thumb
      "[&::-moz-range-thumb]:bg-brand [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-95 [&::-moz-range-thumb]:active:cursor-grabbing",
      "focus-visible:[&::-moz-range-thumb]:scale-110",

      className,
    )}
    {...props}
  />
);
Slider.displayName = "Slider";

export { Slider };
