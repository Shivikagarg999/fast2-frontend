import Footer from "./components/footer/page";
import CategorySection from "../app/category/page";
import ProductListingSection from "./components/sections/productListing/page";

export default function Home() {
  return (
    <>
      <CategorySection/>
      <ProductListingSection/>
      <Footer/>
    </>
  );
}