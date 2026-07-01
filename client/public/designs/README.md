# Mariam Couture — using your own gown images

The Mariam Couture shop currently uses professional placeholder gown photos
so the site is launch-ready with no broken images.

To show YOUR real couture sketches instead, pick either option:

**Option A — via the app (recommended, works on the live site)**
1. Sign in, open the Mariam Couture shop dashboard.
2. Edit each product and upload the gown image (it goes to Cloudinary).

**Option B — bundled with the build**
1. Save your gown images in this folder, e.g. `couture-1.png` … `couture-4.png`.
2. In `server/seed.js`, change the Mariam Couture `images:`/`coverImage:`
   values from `IMG.gownA` etc. to `/designs/couture-1.png` etc.
3. Restart the backend to re-seed.

Filenames are case-sensitive; these files are served at `/designs/<name>`.
