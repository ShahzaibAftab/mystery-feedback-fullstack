import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { z } from 'zod';
import { usernameValidation } from '@/schemas/signUpSchema';

export async function GET(request: Request) {
    try {
        const { username, code } = await request.json()

        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({ username: decodedUsername })
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: 'Error User not found',
                },
                { status: 500 }
            );
        }
        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()

            return Response.json(
                {
                    success: true,
                    message: 'account verified successfully',
                },
                { status: 200 }
            );
        }
        else if (!isCodeNotExpired) {

            return Response.json(
                {
                    success: false,
                    message: 'verification code has expired, please sign-up again',
                },
                { status: 500 }
            );
        }
       
        else {
        
            return Response.json(
                {
                    success: false,
                    message: 'Incorrect Verfication code',
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error verifying username:', error);
        return Response.json(
            {
                success: false,
                message: 'Error verifying username',
            },
            { status: 500 }
        );
    }
}