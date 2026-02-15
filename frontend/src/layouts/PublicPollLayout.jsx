import { Outlet, useSearchParams } from 'react-router-dom';

export default function PublicPollLayout() {
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get('mode') === 'embed';

  return (
    <div className={`min-h-screen ${isEmbed ? 'bg-transparent' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50'}`}>
      <div className={`${isEmbed ? 'py-4' : 'py-8 sm:py-12'} px-4`}>
        <Outlet />
      </div>
    </div>
  );
}
