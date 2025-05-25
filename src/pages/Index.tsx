
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sprout, Users, ShoppingCart, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type User = {
  email: string;
  type: 'farmer' | 'buyer';
  name: string;
};

type Produce = {
  id: string;
  farmerEmail: string;
  farmerName: string;
  cropName: string;
  quantity: string;
  price: string;
  location: string;
  dateAdded: string;
};

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [produces, setProduces] = useState<Produce[]>([]);
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

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === 'signup') {
      setUser({
        email: authForm.email,
        type: authForm.userType,
        name: authForm.name
      });
      toast({
        title: "Account created successfully!",
        description: `Welcome to FarmConnect, ${authForm.name}!`
      });
    } else {
      // Simulate login
      setUser({
        email: authForm.email,
        type: authForm.userType,
        name: authForm.name || 'User'
      });
      toast({
        title: "Logged in successfully!",
        description: `Welcome back to FarmConnect!`
      });
    }
  };

  const handleAddProduce = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduce: Produce = {
      id: Date.now().toString(),
      farmerEmail: user!.email,
      farmerName: user!.name,
      ...produceForm,
      dateAdded: new Date().toLocaleDateString()
    };
    
    setProduces([...produces, newProduce]);
    setProduceForm({
      cropName: '',
      quantity: '',
      price: '',
      location: ''
    });
    
    toast({
      title: "Produce added successfully!",
      description: `${produceForm.cropName} has been listed for sale.`
    });
  };

  const handleLogout = () => {
    setUser(null);
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
  };

  if (!user) {
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
  if (user.type === 'farmer') {
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
                <span className="text-sm text-gray-600">Welcome, {user.name}</span>
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
                    <Label htmlFor="quantity">Quantity Available</Label>
                    <Input
                      id="quantity"
                      type="text"
                      placeholder="e.g., 50 kg, 100 lbs"
                      value={produceForm.quantity}
                      onChange={(e) => setProduceForm({...produceForm, quantity: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="text"
                      placeholder="e.g., $5/kg, $2/lb"
                      value={produceForm.price}
                      onChange={(e) => setProduceForm({...produceForm, price: e.target.value})}
                      required
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
                  {produces.filter(p => p.farmerEmail === user.email).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No produce listed yet. Add your first listing!</p>
                  ) : (
                    produces
                      .filter(p => p.farmerEmail === user.email)
                      .map(produce => (
                        <div key={produce.id} className="border rounded-lg p-4 bg-green-50">
                          <h3 className="font-semibold text-green-800">{produce.cropName}</h3>
                          <p className="text-sm text-gray-600">Quantity: {produce.quantity}</p>
                          <p className="text-sm text-gray-600">Price: {produce.price}</p>
                          <p className="text-sm text-gray-600">Location: {produce.location}</p>
                          <p className="text-xs text-gray-500">Added: {produce.dateAdded}</p>
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
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
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
                  <CardTitle className="text-lg text-green-700">{produce.cropName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Farmer:</span> {produce.farmerName}</p>
                    <p className="text-sm"><span className="font-medium">Quantity:</span> {produce.quantity}</p>
                    <p className="text-sm"><span className="font-medium">Price:</span> {produce.price}</p>
                    <p className="text-sm"><span className="font-medium">Location:</span> {produce.location}</p>
                    <p className="text-xs text-gray-500">Listed: {produce.dateAdded}</p>
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
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
