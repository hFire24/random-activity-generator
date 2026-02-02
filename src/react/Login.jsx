import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [agreeToPolicies, setAgreeToPolicies] = useState(false);

  useEffect(() => {
    // Check if already logged in
    import('../../auth.js').then(({ getCurrentUser, onAuthChange }) => {
      const unsubscribe = onAuthChange((user) => {
        if (user) {
          navigate('/manage');
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (isSignup && !agreeToPolicies) {
      setError("You must agree to the Terms of Use and Privacy Policy to create an account.");
      return;
    }

    try {
      const { login, signup } = await import('../../auth.js');
      const acceptedAt = isSignup ? new Date().toISOString() : null;
      const result = isSignup ? await signup(email, password, acceptedAt) : await login(email, password);
      
      if (result.success) {
        navigate('/manage');
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      if (isSignup && !agreeToPolicies) {
        setError("You must agree to the Terms of Use and Privacy Policy to create an account.");
        return;
      }

      const { signInWithGoogle, deleteAccount } = await import('../../auth.js');
      const acceptedAt = isSignup ? new Date().toISOString() : null;
      const result = await signInWithGoogle(acceptedAt);
      
      if (result.success) {
        if (result.isNewUser && !acceptedAt) {
          await deleteAccount();
          setIsSignup(true);
          setAgreeToPolicies(false);
          setError("To create a new account with Google, you must agree to the Terms of Use and Privacy Policy.");
          return;
        }
        navigate('/manage');
      } else {
        setError(result.error || "Google sign-in failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1>{isSignup ? "Create Account" : "Welcome Back"}</h1>
      <p>Sync your activities across devices</p>
      
      {error && <div style={{ color: "red", marginBottom: "15px", padding: "10px", border: "1px solid red", borderRadius: "5px" }}>{error}</div>}
      
      {isSignup && (
        <div className="policy-agreement" style={{ marginBottom: "15px" }}>
          <label style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={agreeToPolicies}
              onChange={(e) => setAgreeToPolicies(e.target.checked)}
              style={{ marginTop: "4px" }}
            />
            <span>
              I agree to the <Link to="/terms" target="_blank" rel="noreferrer">Terms of Use</Link> and the <Link to="/privacy" target="_blank" rel="noreferrer">Privacy Policy</Link>.
            </span>
          </label>
        </div>
      )}

      {isSignup && (
        <>
          <button 
            onClick={handleGoogleSignIn}
            className="blue"
            style={{ 
              width: "100%", 
              marginBottom: "20px", 
              padding: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              opacity: isSignup && !agreeToPolicies ? 0.6 : 1
            }}
            disabled={isSignup && !agreeToPolicies}
          >
            🔐 Sign Up with Google
          </button>

          <div className="auth-divider" style={{ textAlign: "center", margin: "20px 0", position: "relative" }}>
            <span className="auth-divider-text">OR</span>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        
        <button type="submit" className="green" style={{ width: "100%", marginBottom: "15px", padding: "10px" }}>
          {isSignup ? "Create Account with Email" : "Log In with Email"}
        </button>
      </form>
      
      <button 
        onClick={() => setIsSignup(!isSignup)} 
        style={{ width: "100%", marginTop: "10px", padding: "10px" }}
      >
        {isSignup ? "Already have an account? Log In" : "New user? Create Account"}
      </button>
      
      <div style={{ textAlign: "center", margin: "20px 0", color: "#666" }}>
        <hr style={{ border: "none", borderTop: "1px solid #333", margin: "15px 0" }} />
      </div>
      
      <button 
        onClick={() => navigate('/')} 
        style={{ width: "100%", padding: "10px", opacity: 0.8 }}
      >
        ⚠️ Continue Offline (No Sync)
      </button>
    </div>
  );
};

export default Login;
