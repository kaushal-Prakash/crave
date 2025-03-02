"use client";
import React from "react";

function AboutUsPage() {
  return (
    <div
      className="min-h-screen p-8"
      style={{
        background:
          "linear-gradient(135deg, #FFD700 0%, #32CD32 50%, #FFA500 100%)",
        fontFamily: "'Press Start 2P', cursive",
      }}
    >
      <div className="max-w-4xl mt-16 mx-auto bg-white rounded-xl shadow-2xl p-8 border-2 border-orange-300">
        <h1 className="text-4xl font-bold text-center mb-8 text-orange-600">
          About Us
        </h1>

        <div className="space-y-6">
          <p className="text-lg text-gray-800 leading-relaxed">
            Welcome to <span className="font-bold text-green-700">Crave</span>,
            your go-to platform for discovering, sharing, and creating delicious
            recipes! We are passionate about food and believe that cooking should
            be fun, accessible, and inspiring for everyone.
          </p>

          <p className="text-lg text-gray-800 leading-relaxed">
            Our mission is to bring people together through the joy of cooking.
            Whether you're a seasoned chef or a beginner in the kitchen, Crave
            has something for everyone. Explore our collection of recipes, share
            your own creations, and connect with a community of food lovers.
          </p>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-green-700 mb-4">
              Meet the Team
            </h2>

            <div className="space-y-4">
              <div className="bg-yellow-100 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-orange-600">
                  Kaushal Prakash
                </h3>
                <p className="text-gray-700">
                  Kaushal handled all front-end and back-end integration,
                  ensuring a seamless and user-friendly experience. His expertise
                  in full-stack development brought Crave to life.
                </p>
              </div>

              <div className="bg-green-100 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-700">Ibaad</h3>
                <p className="text-gray-700">
                  Ibaad managed the database schema and data management,
                  ensuring that all recipes and user data are stored securely and
                  efficiently.
                </p>
              </div>

              <div className="bg-orange-100 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-orange-600">
                  Jayantilal
                </h3>
                <p className="text-gray-700">
                  Jayantilal collaborated on database design and management,
                  contributing to the robust and scalable architecture of Crave.
                </p>
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-800 leading-relaxed mt-8">
            Together, we've built Crave with love and dedication. We hope you
            enjoy using it as much as we enjoyed creating it. Happy cooking!
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutUsPage;