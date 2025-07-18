import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
// TODO: Create password page component
// import UpdatePasswordForm from "@/app/password/page";

describe("UpdatePasswordForm", () => {
  it.skip("renders all form fields", () => {
    // TODO: Implement password page component
    // render(<UpdatePasswordForm />);
    // expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    // expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    // expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    // expect(screen.getByRole("button", { name: /Update Password/i })).toBeInTheDocument();
  });

  it.skip("shows validation errors for empty fields", async () => {
    // TODO: Implement password page component
    // render(<UpdatePasswordForm />);
    // fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));
    // expect(
    //   await screen.findByText(/Current password is required/i)
    // ).toBeInTheDocument();
    // expect(screen.getByText(/New password is required/i)).toBeInTheDocument();
    // expect(screen.getByText(/Confirm password is required/i)).toBeInTheDocument();
  });

  it.skip("shows error if new password and confirm password do not match", async () => {
    // TODO: Implement password page component
    // render(<UpdatePasswordForm />);
    // fireEvent.change(screen.getByLabelText(/New Password/i), {
    //   target: { value: "newpassword" },
    // });
    // fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
    //   target: { value: "differentpassword" },
    // });
    // fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));
    // expect(
    //   await screen.findByText(/Passwords do not match/i)
    // ).toBeInTheDocument();
  });

  it.skip("submits valid form and shows success message", async () => {
    // TODO: Implement password page component
    // render(<UpdatePasswordForm />);
    // fireEvent.change(screen.getByLabelText(/Current Password/i), {
    //   target: { value: "currentpassword" },
    // });
    // fireEvent.change(screen.getByLabelText(/New Password/i), {
    //   target: { value: "newpassword" },
    // });
    // fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
    //   target: { value: "newpassword" },
    // });
    // fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    // expect(
    //   await screen.findByText(/Password updated successfully/i)
    // ).toBeInTheDocument();
  });
});
