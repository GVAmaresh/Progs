import AccountMenu from "../components/Accounts/accountMenu";

export default function Nav({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="bg-black h-screen">
        <div className="flex justify-end ">
          <AccountMenu />
        </div>
        <div className="">{children}</div>
      </div>
    </>
  );
}