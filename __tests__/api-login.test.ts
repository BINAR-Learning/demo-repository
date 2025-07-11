/**
 * @jest-environment node
 */
import { POST } from "@/app/api/login/route";
import { NextRequest } from "next/server";

describe("POST /api/login", () => {
  it("should return 400 if email is missing", async () => {
      // TODO: Implement this test
  });

  // unit test untuk api login if email is missing
  it("should return 400 if email is missing", async () => {
      const request = new NextRequest("http://localhost/api/login", {
          method: "POST",
          body: JSON.stringify({ password: "validPassword123" }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({ message: "Email and password are required." });
  });
});
