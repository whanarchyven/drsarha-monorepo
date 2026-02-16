import { deleteAuthToken } from '@/shared/utils/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logout successful' });
  await deleteAuthToken();
  response.cookies.delete('token');
  response.cookies.delete('user');
  return response;
}
