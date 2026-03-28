// frontend/components/BedrockProvider.js
"use client";

import React from "react";
import { BedrockPassportProvider } from "@bedrock_org/passport";

const BedrockProvider = ({ children }) => {
  return (
    <BedrockPassportProvider
      baseUrl="https://api.bedrockpassport.com"
      authCallbackUrl="https://metatrace-frontend.vercel.app/auth/callback" // or your deployed URL
      tenantId="your-tenant-id-here"
    >
      {children}
    </BedrockPassportProvider>
  );
};

export default BedrockProvider;
