import { type SvgProps } from "./svgUtils";

export default function KickSVG({
  size = 1,
  relativeSize = true,
  className = "",
  color1 = "fill-primary",
}: SvgProps) {
  if (relativeSize) size *= 24;

  return (
    <svg
      fill="#000000"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 231"
      enable-background="new 0 0 256 231"
      className={className}
    >
      <path
        className={color1}
        d="M109.571,181.114l-31.497,12.953l9.702,9.442l-24.694,25.374L48.95,215.131c-5.203-5.065-9.34-11.12-12.166-17.808
	l-2.756-6.523l-10.991-10.697l-5.204,5.483L2,172.428V85l64.896,48.899l-5.94,6.258c22.595,8.254,47.941,5.379,68.217-8.075
	l2.299-1.526c4.55-3.018,10.588-2.455,14.501,1.352l5.899,5.741L109.571,181.114z M250.972,126.087l-29.367-29.367
	c-1.939-1.938-4.568-3.027-7.309-3.027H186.32l13.714-37.959h42.154c4.349,0,7.875-3.526,7.875-7.875
	c0-4.349-3.526-7.875-7.875-7.875h-66.979c-3.559,0-7.021,0.717-10.286,2.13l-24.256,10.495L121.688,33.53
	c-3.065-3.083-8.053-3.098-11.136-0.029c-3.084,3.066-3.097,8.052-0.03,11.136l22.764,22.887c1.76,1.768,4.742,3.122,8.71,1.674
	l18.39-7.957l-14.044,39.051c-1.44,3.687-1.175,8.788,1.41,11.698l22.341,23.512l-7.393,33.572
	c-1.227,5.575,2.298,11.09,7.872,12.317c0.749,0.165,1.496,0.244,2.233,0.244c4.747,0,9.022-3.29,10.084-8.116l8.525-38.718
	c0.712-3.233-0.168-6.61-2.365-9.085l-10.076-11.349h31.042l26.34,26.34c4.038,4.035,10.582,4.037,14.618,0
	C255.009,136.669,255.009,130.124,250.972,126.087z M117.491,99.918l6.949-8.001l10,17.407L117.491,99.918z M96.5,128.313
	l2.543-16.324L128,118.592L96.5,128.313z M166.262,18.481c0,9.038,7.327,16.365,16.365,16.365c9.038,0,16.365-7.327,16.365-16.365
	s-7.327-16.365-16.365-16.365C173.589,2.116,166.262,9.443,166.262,18.481z"
      />
    </svg>
  );
}
