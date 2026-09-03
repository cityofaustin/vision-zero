import { useAuth0 } from "@auth0/auth0-react";

const serviceRequestParams = {
  // "What applicaiton are you using (vision zero)"
  field_1130: ["5da8d25798bb900018bf82e0"],
  // "What do you need help with"
  field_398: "Bug Report — Something is not working",
  // email
  field_406: "",
};

const SERVICE_REQUEST_BASE_URL =
  "https://atd.knack.com/dts#new-service-request/?view_249_vars=";

export const useServiceRequestUrl = () => {
  const { user } = useAuth0();
  const userEmail = user?.email || "";
  const payload = { ...serviceRequestParams, field_406: userEmail };
  return `${SERVICE_REQUEST_BASE_URL}${encodeURIComponent(JSON.stringify(payload))}`;
};
