import { primevestExpertiseImageData } from "@/lib/primevestExpertiseImageData";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const imageBase64 = primevestExpertiseImageData[slug];

  if (!imageBase64) {
    return new Response("Not found", { status: 404 });
  }

  const imageBuffer = Buffer.from(imageBase64, "base64");

  return new Response(imageBuffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
