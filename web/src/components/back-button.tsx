import Link from "next/link";

type Props = {
  redirectTo: string;
};

export function BackButton({ redirectTo }: Props) {
  return (
    <Link href={redirectTo}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
    </Link>
  );
}
