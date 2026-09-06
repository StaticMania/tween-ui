import type { NextConfig } from 'next';
import { withDocora } from 'docora/next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.68.113'],
};

export default withDocora(nextConfig);
