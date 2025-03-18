// app/[locale]/page.tsx
export default function Page({ params }: { params: { locale: string } }) {
    return (
        <div>
            <h1>Test Page</h1>
            <p>Current locale: {params.locale}</p>
        </div>
    );
}

// import type { NextPage } from 'next';
// import HomeContent from "../home/HomeContent";

// const Home: NextPage = () => {
//     return <HomeContent />;
// };

// export default Home;