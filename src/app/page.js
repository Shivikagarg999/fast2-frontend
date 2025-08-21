import Footer from "./components/footer/page";
import Header from "./components/header/page";
import CategorySection from "./components/sections/category/page";
import ProductListingSection from "./components/sections/productListing/page";

export default function Home() {
  return (
    <>
      <Header/>
      <CategorySection/>
      <ProductListingSection/>
      <Footer/>
    </>
  );
}