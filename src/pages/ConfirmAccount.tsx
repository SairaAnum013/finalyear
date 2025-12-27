const ConfirmAccount = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-xl text-center">
        <h1 className="text-2xl font-semibold mb-4">Account Created</h1>
        <p className="text-base text-muted-foreground">
          Your account has been created successfully. Please go back to your Android app and
          continue to login there.
        </p>
      </div>
    </div>
  );
};

export default ConfirmAccount;
