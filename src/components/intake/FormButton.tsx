import buttonStyles from "@/components/Button.module.css";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  children: React.ReactNode;
  type?: "button" | "submit";
  variant?: Variant;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  dataCta?: string;
};

export function FormButton({
  children,
  type = "button",
  variant = "primary",
  onClick,
  disabled,
  className,
  dataCta,
}: Props) {
  const classes = [buttonStyles.button, buttonStyles[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      data-cta={dataCta}
    >
      {children}
    </button>
  );
}
