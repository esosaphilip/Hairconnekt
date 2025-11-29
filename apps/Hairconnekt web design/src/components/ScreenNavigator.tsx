import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  Sparkles, 
  Home, 
  User, 
  Briefcase,
  ChevronRight,
  Shield 
} from 'lucide-react';

export function ScreenNavigator() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Entry & Onboarding',
      icon: Sparkles,
      color: '#FF6B6B',
      screens: [
        { name: 'Splash Screen', path: '/splash' },
        { name: 'Client Onboarding', path: '/onboarding' },
        { name: 'Location Selection', path: '/location' },
        { name: 'Welcome Screen', path: '/' },
      ]
    },
    {
      title: 'Client App',
      icon: User,
      color: '#8B4513',
      screens: [
        { name: 'Home Screen', path: '/home' },
        { name: 'Search Screen', path: '/search' },
        { name: 'Appointments', path: '/appointments' },
        { name: 'Messages', path: '/messages' },
        { name: 'Profile', path: '/profile' },
        { name: 'All Styles', path: '/all-styles' },
      ]
    },
    {
      title: 'Provider App',
      icon: Briefcase,
      color: '#8B4513',
      screens: [
        { name: 'Provider Welcome', path: '/provider-onboarding' },
        { name: 'Provider Tutorial', path: '/provider-onboarding/tutorial' },
        { name: 'Provider Dashboard', path: '/provider/dashboard' },
        { name: 'Provider Calendar', path: '/provider/calendar' },
        { name: 'Provider Clients', path: '/provider/clients' },
        { name: 'Provider Earnings', path: '/provider/earnings' },
        { name: 'Provider More', path: '/provider/more' },
      ]
    },
    {
      title: 'Legal & Help',
      icon: Shield,
      color: '#4A90E2',
      screens: [
        { name: 'Privacy & Security', path: '/privacy' },
        { name: 'Terms & Conditions', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy-policy' },
        { name: 'Impressum', path: '/imprint' },
        { name: 'User Manual', path: '/user-manual' },
        { name: 'Support', path: '/support' },
        { name: 'Delete Account', path: '/delete-account' },
      ]
    }
  ];

  const handleClearStorage = () => {
    localStorage.clear();
    window.location.href = '/splash';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#8B4513] to-[#FF6B6B] rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">HairConnekt Screen Navigator</h1>
          <p className="text-gray-600">
            Navigate to any screen in the app
          </p>
        </div>

        {/* Reset Button */}
        <Card className="p-4 mb-6 bg-white border-2 border-dashed border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 mb-1">Reset App State</p>
              <p className="text-gray-500 text-sm">
                Clear localStorage and restart from splash screen
              </p>
            </div>
            <Button 
              variant="default"
              size="sm"
              onClick={handleClearStorage}
              className="bg-[#FF6B6B] hover:bg-[#FF5555]"
            >
              Reset
            </Button>
          </div>
        </Card>

        {/* Screen Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="p-6 bg-white shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${section.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: section.color }} />
                  </div>
                  <div>
                    <h2 className="text-gray-900">{section.title}</h2>
                    <p className="text-gray-500 text-sm">
                      {section.screens.length} screens
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {section.screens.map((screen) => (
                    <button
                      key={screen.path}
                      onClick={() => navigate(screen.path)}
                      className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-between transition-colors group"
                    >
                      <span className="text-gray-700 group-hover:text-gray-900">
                        {screen.name}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#8B4513] transition-colors" />
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer Stats */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-1">70</div>
              <div className="text-white/80 text-sm">Total Screens</div>
            </div>
            <div>
              <div className="text-3xl mb-1">75+</div>
              <div className="text-white/80 text-sm">Components</div>
            </div>
            <div>
              <div className="text-3xl mb-1">✅</div>
              <div className="text-white/80 text-sm">Complete</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
