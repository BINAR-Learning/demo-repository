
import * as React from "react"

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"

const breakpointValues = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
}

/**
 * Returns true if the window width is >= the given breakpoint.
 * e.g. useBreakpoint("sm") => true if width >= 640.
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
    const [isMatch, setIsMatch] = React.useState<boolean>(false)

    React.useEffect(() => {
        const minWidth = breakpointValues[breakpoint]
        const mediaQueryList = window.matchMedia(`(min-width: ${minWidth}px)`)

        // Handler to update `isMatch` when the media query changes
        const handleChange = (e: MediaQueryListEvent) => {
            setIsMatch(e.matches)
        }

        // Initial check
        setIsMatch(mediaQueryList.matches)

        // Listen for changes
        mediaQueryList.addEventListener("change", handleChange)

        // Cleanup
        return () => {
            mediaQueryList.removeEventListener("change", handleChange)
        }
    }, [breakpoint])

    return isMatch
}


export function useIsMobile(): boolean {
    const isAtLeastSm = useBreakpoint("sm") // true if >= 640
    return !isAtLeastSm // i.e. < 640
}

export function useIsTablet(): boolean {
    const isMd = useBreakpoint("md")
    return isMd
}

export function useIsDesktop(): boolean {
    const isLg = useBreakpoint("lg")
    return isLg
}

export function useIsLargeDesktop(): boolean {
    const isXl = useBreakpoint("xl")
    return isXl
}

export function useBreakpointValue<T>(values: Record<Breakpoint, T>): T {
    const [value, setValue] = React.useState<T>(values.xs)

    React.useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth

            if (width >= breakpointValues["2xl"]) {
                setValue(values["2xl"])
            } else if (width >= breakpointValues.xl) {
                setValue(values.xl)
            } else if (width >= breakpointValues.lg) {
                setValue(values.lg)
            } else if (width >= breakpointValues.md) {
                setValue(values.md)
            } else if (width >= breakpointValues.sm) {
                setValue(values.sm)
            } else {
                setValue(values.xs)
            }
        }

        window.addEventListener("resize", handleResize)
        handleResize() // Initial check

        return () => window.removeEventListener("resize", handleResize)
    }, [values])

    return value
}