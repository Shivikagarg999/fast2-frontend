import Footer from "./components/footer/page";
import CategorySection from "../app/category/page";
import ProductListingSection from "./components/sections/productListing/page";
import Banner from "./components//banner/page";

export default function Home() {
  return (
    <>
      <Banner/>
      <CategorySection/>
      <ProductListingSection/>
      <Footer/>
    </>
  );
}