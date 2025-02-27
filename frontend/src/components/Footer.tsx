import React from "react";

function Footer() {
  return (
    <footer className="w-full py-6 mt-auto shadow-md bg-gradient-to-r from-appetizingRed to-warmOrange bg-orange-300 rounded-t-xl">
      <div className="container mx-auto text-center text-elegantWhite">
        <p className="text-lg font-semibold drop-shadow-md">
          "Good food is the foundation of genuine happiness."
        </p>
        <p className="text-sm mt-2 text-green-800 font-semibold">&copy; {new Date().getFullYear()} Crave. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;