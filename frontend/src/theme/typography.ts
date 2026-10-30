import { TypographyOptions } from "@mui/material/styles/createTypography";

export const typography: TypographyOptions = {
  fontFamily: [
    '"Plus Jakarta Sans"',
    '"Roboto"',
    '"Helvetica"',
    '"Arial"',
    "sans-serif",
  ].join(","),
  h1: {
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "1.625rem",
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: "-0.015em",
  },
  h3: {
    fontSize: "1.375rem",
    fontWeight: 600,
    lineHeight: 1.35,
    letterSpacing: "-0.01em",
  },
  h4: {
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.45,
  },
  h6: {
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: "0.9375rem",
    lineHeight: 1.5,
  },
  body2: {
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: "0.9375rem",
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  button: {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.875rem",
  },
  caption: {
    fontSize: "0.75rem",
    lineHeight: 1.4,
  },
};

