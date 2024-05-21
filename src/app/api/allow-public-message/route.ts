import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    await dbConnect();

    const req = request
    // console.log('eee', req.url)

    const username = getUsernameFromUrl(req.url);
    // console.log('get username', username);


    try {

        const findUser = await UserModel.findOne({ username: username as string });


        if (!findUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 }
            );
        }

        if (!findUser.isAcceptingMessage) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User is not accepting messages',
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'User is accepting messages',
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error checking user status:', error);

        return NextResponse.json(
            { success: false, message: 'Error checking user status' },
            { status: 500 }
        );
    }
}
function getUsernameFromUrl(url) {
    // Find the index of the '?' character
    const queryStringStart = url.indexOf('?');

    // Check if '?' exists in the URL and it's not at the end
    if (queryStringStart === -1 || queryStringStart === url.length - 1) {
        return null; // No query string found
    }

    // Extract the query string part of the URL
    const queryString = url.substring(queryStringStart + 1);

    // Split the query string into key-value pairs
    const queryParams = queryString.split('&');

    // Find and return the value of the 'username' parameter
    for (let param of queryParams) {
        const [key, value] = param.split('=');
        if (key === 'username') {
            return decodeURIComponent(value);
        }
    }

    return null; // 'username' parameter not found
}