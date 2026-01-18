import Logo from "@/assets/logo.svg";
export const Home = () => {
  return (
    <section className="flex flex-col justify-center mx-10 my-22 items-center text-center gap-6 max-w-5xl">
      <div className="flex gap-2 items-center">
        <a href="https://geonotes.in" target="_blank" className="min-w-10">
          <img src={Logo} className="h-25" alt="React logo" />
        </a>
        <h1>Geonotes</h1>
      </div>

      <h2>Welcome to Geonotes</h2>
      <p>
        Discover a new way to interact with your surroundings. Geonotes allows
        you to leave notes and find notes left by others at specific locations.
        Explore the world with a new perspective!
      </p>
      <h3>About Geonotes</h3>
      <p>
        Geonotes is your personal geolocation app that allows you to leave and
        discover notes at specific locations around the globe. Whether you're
        traveling or exploring your own city, Geonotes connects you with your
        surroundings uniquely.
      </p>
    </section>
  );
};
