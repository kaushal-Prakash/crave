"use client";
import Link from "next/link";

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutralBeige to-elegantWhite flex flex-col items-center justify-center">
      <main className="flex flex-col items-center text-center px-4 min-h-screen justify-center relative w-full">
        <video
          className="absolute object-cover -z-10 h-full w-full overflow-hidden opacity-20"
          autoPlay
          muted
          loop
        >
          <source src="/landing/landing-video.mp4" />
          video not supported!!
        </video>
        <h1
          className="text-6xl font-bold text-warmOrange mb-4 bg-gradient-to-r bg-clip-text text-transparent from-orange-400 to-orange-700 tracking-wide hero-text-1"
          style={{ textShadow: "1px 3px 10px black inset" }}
        >
          Discover & Share Delicious Recipes
        </h1>
        <p className="text-xl text-gray-700 mb-8 hero-text-2">
          Join the Crave community to explore, share, and savor the best recipes
          from around the world.
        </p>
        <div className="space-x-4">
          <Link
            className="bg-appetizingRed text-elegantWhite px-8 py-3 rounded-full hover:bg-freshGreen text-white hover:bg-orange-600 hover:tracking-widest transform hover transition-all duration-300 shadow-lg hover:shadow-xl bg-orange-400 cursor-pointer font-semibold hero-btn"
            href="/home"
          >
            Add Your Recipe
          </Link>
        </div>
      </main>

      <section className="w-full max-w-3xl mt-10 text-center min-h-screen flex justify-center flex-col items-center gap-5">
        <h2 className="text-3xl md:text-4xl bg-gradient-to-r bg-clip-text text-transparent from-orange-400 to-orange-700 font-bold text-appetizingRed mb-6">
          Website Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-blue-100 hover:bg-blue-200 transition duration-300 ease-in-out transform hover:scale-105 shadow-md rounded-lg p-6 hover:shadow-lg">
            <h3 className="text-xl font-semibold text-warmOrange bg-gradient-to-r bg-clip-text text-transparent from-orange-600 to-yellow-700">
              ✔️ Genuine Recipes
            </h3>
            <p className="text-gray-700 mt-2">
              Authentic and verified recipes from real cooks.
            </p>
          </div>
          <div className="bg-blue-100 hover:bg-blue-200 transition duration-300 ease-in-out transform hover:scale-105 shadow-md rounded-lg p-6 hover:shadow-lg">
            <h3 className="text-xl font-semibold text-warmOrange bg-gradient-to-r bg-clip-text text-transparent from-orange-600 to-yellow-700">
              ✔️ Friendly Community
            </h3>
            <p className="text-gray-700 mt-2">
              Join a positive and supportive environment.
            </p>
          </div>
          <div className="bg-blue-100 hover:bg-blue-200 transition duration-300 ease-in-out transform hover:scale-105 shadow-md rounded-lg p-6 hover:shadow-lg">
            <h3 className="text-xl font-semibold text-warmOrange bg-gradient-to-r bg-clip-text text-transparent from-orange-600 to-yellow-700">
              ✔️ No Toxicity
            </h3>
            <p className="text-gray-700 mt-2">
              Safe space with no negative interactions.
            </p>
          </div>
          <div className="bg-blue-100 hover:bg-blue-200 transition duration-300 ease-in-out transform hover:scale-105 shadow-md rounded-lg p-6 hover:shadow-lg">
            <h3 className="text-xl font-semibold text-warmOrange bg-gradient-to-r bg-clip-text text-transparent from-orange-600 to-yellow-700">
              ✔️ Easy Sharing
            </h3>
            <p className="text-gray-700 mt-2">
              Like and share your favorite recipes effortlessly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
