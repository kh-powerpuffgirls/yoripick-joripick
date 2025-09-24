import { useSearchParams } from "react-router-dom";
import SocialEnrollModal from "../../components/Security/SocialEnrollModal";

export default function OAuthUsernamePage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const provider = searchParams.get("provider") || "kakao";
  const providerUserId = searchParams.get("providerUserId") || "";

  return (
    <SocialEnrollModal
      email={email}
      provider={provider}
      providerUserId={providerUserId}
      onClose={() => (window.location.href = "/login")}
    />
  );
}