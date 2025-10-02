import RecoCourse from "../components/RecoCourse";
import Review from "../components/Review";
import QrCom from "../components/QrCom";
import LearnersCard from "../components/LearnersCard";

const HomePage = () => {
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      <div className="w-full md:w-3/5 lg:w-2/3 flex flex-col ">
        <RecoCourse />
        <Review />
        <QrCom />
      </div>
      <div className="w-full md:w-2/5 lg:w-1/3 flex justify-center items-start mt-8 md:mt-0">
        <LearnersCard />
      </div>
    </div>
  );
};

export default HomePage;
