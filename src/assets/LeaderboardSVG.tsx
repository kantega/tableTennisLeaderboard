import { type SvgProps } from "./svgUtils";

export default function LeaderboardSVG({
  size = 1,
  relativeSize = true,
  className = "",
  color1 = "fill-primary",
}: SvgProps) {
  if (relativeSize) size *= 24;

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={color1}
        d="M23.0938 3.9729C23.0938 4.09009 23.8359 7.29321 21.7656 10.3401C20.3203 12.5276 17.8594 14.051 14.4609 14.9495C13.7188 15.1448 12.9375 15.8088 12.9375 16.551V18.8557H16.0234C16.4922 18.8557 16.9219 19.2854 16.9219 19.7932C16.9219 20.3401 16.5312 20.7307 16.0234 20.7307H7.9375C7.39062 20.7307 7 20.3401 7 19.7932C7 19.2854 7.39062 18.8557 7.9375 18.8557H11.0625L11.0234 16.551C11.0234 15.8088 10.2422 15.1448 9.5 14.9495C6.10156 14.051 3.64062 12.5276 2.19531 10.3401C0.125 7.29321 0.867188 4.09009 0.867188 3.9729C0.984375 3.54321 1.375 3.23071 1.80469 3.23071H5.75C5.71094 2.76196 5.71094 2.33228 5.75 1.94165C5.75 1.27759 6.29688 0.730713 7 0.730713H16.9609C17.6641 0.730713 18.2109 1.27759 18.2109 1.94165C18.25 2.33228 18.25 2.76196 18.2109 3.23071H22.1562C22.5859 3.23071 22.9766 3.54321 23.0938 3.9729ZM3.75781 9.32446C4.65625 10.6917 6.10156 11.7463 8.01562 12.5276C6.57031 10.262 5.98438 7.44946 5.75 5.10571H2.625C2.58594 6.04321 2.66406 7.7229 3.75781 9.32446ZM12 14.4807C14.1484 12.0588 16.375 9.75415 16.3359 2.60571H7.625C7.58594 9.75415 9.8125 12.0588 12 14.4807ZM20.2031 9.32446C21.2969 7.7229 21.375 6.04321 21.3359 5.10571H18.2109C17.9766 7.44946 17.3906 10.262 15.9453 12.5276C17.8594 11.7463 19.3047 10.6917 20.2031 9.32446Z"
      />
    </svg>
  );
}
