import "./global.css";

export const metadata = {
    title: "F1-ChatBot",
    description: "Find out the last news from Formula 1."
};

const RootLayout = ({ children }) => {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

export default RootLayout;