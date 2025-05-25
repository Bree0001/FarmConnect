
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sprout, Users, ShoppingCart, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type UserProfile = {
  id: string;
  full_name: string | null;
  user_type: string | null;
  location: string | null;
};

type Produce = {
  id: string;
  user_id: string | null;
  farmer_name: string | null;
  crop_name: string | null;
  quantity: number | null;
  price_per_kg: number | null;
  location: string | null;
  date_posted: string | null;
};

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [produces, setProduces] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Auth form state
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    userType: 'buyer' as 'farmer' | 'buyer'
  });

  // Produce form state
  const [produceForm, setProduceForm] = useState({
    cropName: '',
    quantity: '',
    price: '',
    location: ''
  });

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile after auth state change
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch produce listings
  const fetchProduces = async () => {
    try {
      const { data, error } = await supabase
        .from('produce')
        .select('*')
        .order('date_posted', { ascending: false });
      
      if (error) {
        console.error('Error fetching produces:', error);
        return;
      }
      
      setProduces(data || []);
    } catch (error) {
      console.error('Error fetching produces:', error);
    }
  };

  // Load produces when user is authenticated
  useEffect(() => {
    if (user) {
      fetchProduces();
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
          options: {
            data: {
              name: authForm.name,
              userType: authForm.userType
            }
          }
        });
        
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        toast({
          title: "Account created successfully!",
          description: `Welcome to FarmConnect, ${authForm.name}! Please check your email to verify your account.`
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password
        });
        
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        toast({
          title: "Logged in successfully!",
          description: "Welcome back to FarmConnect!"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !userProfile) {
      toast({
        title: "Error",
        description: "You must be logged in to add produce.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('produce')
        .insert({
          user_id: user.id,
          farmer_name: userProfile.full_name,
          crop_name: produceForm.cropName,
          quantity: parseInt(produceForm.quantity),
          price_per_kg: parseFloat(produceForm.price),
          location: produceForm.location
        });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      setProduceForm({
        cropName: '',
        quantity: '',
        price: '',
        location: ''
      });
      
      // Refresh produces list
      fetchProduces();
      
      toast({
        title: "Produce added successfully!",
        description: `${produceForm.cropName} has been listed for sale.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add produce. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      setAuthForm({
        email: '',
        password: '',
        name: '',
        userType: 'buyer'
      });
      
      toast({
        title: "Logged out",
        description: "Come back soon!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleContactFarmer = (produce: Produce) => {
    toast({
      title: "Contact Information",
      description: `Contact ${produce.farmer_name} for ${produce.crop_name}. (Contact feature coming soon!)`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Sprout className="h-12 w-12 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading FarmConnect...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Sprout className="h-8 w-8 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">FarmConnect</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Connecting Farms to Tables
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join FarmConnect to buy fresh produce directly from local farmers or sell your harvest to eager buyers.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="text-center p-6 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">For Farmers</h3>
                <p className="text-gray-600">List your fresh produce and connect directly with buyers in your area.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <ShoppingCart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">For Buyers</h3>
                <p className="text-gray-600">Discover fresh, local produce and support farmers in your community.</p>
              </CardContent>
            </Card>
          </div>

          {/* Auth Forms */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">
                {authMode === 'login' ? 'Welcome Back' : 'Join FarmConnect'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      Login
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="userType">I am a...</Label>
                      <select
                        id="userType"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={authForm.userType}
                        onChange={(e) => setAuthForm({...authForm, userType: e.target.value as 'farmer' | 'buyer'})}
                      >
                        <option value="buyer">Buyer</option>
                        <option value="farmer">Farmer</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Farmer Dashboard
  if (userProfile?.user_type === 'farmer') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Sprout className="h-8 w-8 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">FarmConnect</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {userProfile.full_name}</span>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Farmer Dashboard</h2>
            <p className="text-gray-600">Manage your produce listings and connect with buyers.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Add Produce Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <span>Add New Produce</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduce} className="space-y-4">
                  <div>
                    <Label htmlFor="cropName">Crop Name</Label>
                    <Input
                      id="cropName"
                      type="text"
                      placeholder="e.g., Tomatoes, Carrots, Apples"
                      value={produceForm.cropName}
                      onChange={(e) => setProduceForm({...produceForm, cropName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity Available (kg)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="e.g., 50"
                      value={produceForm.quantity}
                      onChange={(e) => setProduceForm({...produceForm, quantity: e.target.value})}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price per kg ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 5.00"
                      value={produceForm.price}
                      onChange={(e) => setProduceForm({...produceForm, price: e.target.value})}
                      required
                      min="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g., City, State"
                      value={produceForm.location}
                      onChange={(e) => setProduceForm({...produceForm, location: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Add Produce
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* My Listings */}
            <Card>
              <CardHeader>
                <CardTitle>My Produce Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {produces.filter(p => p.user_id === user.id).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No produce listed yet. Add your first listing!</p>
                  ) : (
                    produces
                      .filter(p => p.user_id === user.id)
                      .map(produce => (
                        <div key={produce.id} className="border rounded-lg p-4 bg-green-50">
                          <h3 className="font-semibold text-green-800">{produce.crop_name}</h3>
                          <p className="text-sm text-gray-600">Quantity: {produce.quantity} kg</p>
                          <p className="text-sm text-gray-600">Price: ${produce.price_per_kg}/kg</p>
                          <p className="text-sm text-gray-600">Location: {produce.location}</p>
                          <p className="text-xs text-gray-500">
                            Added: {produce.date_posted ? new Date(produce.date_posted).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Buyer Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Sprout className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">FarmConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {userProfile?.full_name}</span>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Buyer Dashboard</h2>
          <p className="text-gray-600">Browse fresh produce from local farmers.</p>
        </div>

        {/* Produce Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produces.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No produce available yet</h3>
              <p className="text-gray-500">Check back soon for fresh listings from local farmers!</p>
            </div>
          ) : (
            produces.map(produce => (
              <Card key={produce.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">{produce.crop_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Farmer:</span> {produce.farmer_name}</p>
                    <p className="text-sm"><span className="font-medium">Quantity:</span> {produce.quantity} kg</p>
                    <p className="text-sm"><span className="font-medium">Price:</span> ${produce.price_per_kg}/kg</p>
                    <p className="text-sm"><span className="font-medium">Location:</span> {produce.location}</p>
                    <p className="text-xs text-gray-500">
                      Listed: {produce.date_posted ? new Date(produce.date_posted).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleContactFarmer(produce)}
                  >
                    Contact Farmer
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
