# Frontend (Next.js)

This directory contains the Next.js frontend for deployment on Vercel.

## Deploy on Vercel

1. Create a new repository with the contents of this `frontend` folder.
2. Push to GitHub, GitLab, or Bitbucket.
3. On [Vercel](https://vercel.com), import the repository and follow the instructions.
4. Set any required environment variables (e.g., NEXT_PUBLIC_API_URL pointing to your Render backend).
5. Deploy!

## API URLs
- Update all API calls in the frontend to use your Render backend URL (e.g., `https://your-backend.onrender.com`).
- Example: set `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com` in your Vercel project settings.
