const PasswordUpdated = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-xl text-center">
        <h1 className="text-2xl font-semibold mb-4">Password Updated</h1>
        <p className="text-base text-muted-foreground">
          Your password has been updated successfully. Please go back to the login page in your
          Android app to sign in.
        </p>
      </div>
    </div>
  );
};

export default PasswordUpdated;
