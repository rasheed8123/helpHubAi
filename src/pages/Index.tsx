import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/Navbar';
import { Search, Users, Settings, Mail, Calendar, Ticket, ArrowRight, Sparkles, Loader2, Shield, Zap, Brain, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/config';

const Index = () => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const navigate = useNavigate();

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: question,
          isPublic: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setResponse({
        type: 'success',
        message: data.response
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      setResponse({
        type: 'error',
        message: 'I apologize, but I encountered an error. Please try creating a support ticket for your query.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Support",
      description: "Intelligent responses and automated ticket routing",
      color: "from-violet-600 to-purple-600"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-grade encryption and compliance standards",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Real-time updates and instant notifications",
      color: "from-amber-600 to-orange-600"
    }
  ];

  const benefits = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "24/7 Support",
      description: "Round-the-clock assistance for all your needs"
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Multi-channel",
      description: "Support across email, chat, and voice"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "99.9% Uptime",
      description: "Reliable service you can count on"
    }
  ];

  const stats = [
    { value: "10k+", label: "Active Users" },
    { value: "50k+", label: "Tickets Resolved" },
    { value: "99%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-3 rounded-2xl shadow-xl animate-pulse">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 animate-gradient">
              Your Intelligent Workplace Assistant
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto animate-slide-up">
              Experience the future of workplace support with AI-powered assistance, instant responses, and seamless ticket management
            </p>
            
            {/* Question Input */}
            <div className="max-w-2xl mx-auto mb-12">
              <form onSubmit={handleQuestionSubmit} className="relative">
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="Ask me anything about workplace support..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full px-6 py-5 text-lg rounded-2xl border-2 border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 bg-white/90 backdrop-blur-sm shadow-xl transition-all duration-300 group-hover:shadow-2xl"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit"
                    size="lg" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl transition-all duration-300 hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5 mr-2" />
                    )}
                    Ask AI
                  </Button>
                </div>
              </form>
            </div>

            {/* AI Response */}
            {response && (
              <div className="max-w-2xl mx-auto mb-12 animate-fade-in">
                <Alert variant={response.type === 'error' ? 'destructive' : 'default'} className="bg-white/80 backdrop-blur-sm">
                  <AlertDescription className="text-base">
                    {response.message}
                    {response.type === 'error' && (
                      <div className="mt-4">
                        <Link to="/login">
                          <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                            Create Support Ticket
                          </Button>
                        </Link>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <div className="flex justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/50"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-slide-up">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Everything you need to streamline your workplace support
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-2xl transition-all duration-500 animate-scale-in border-0 bg-white/80 backdrop-blur-sm group hover:scale-105 overflow-hidden relative" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="text-center relative">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-violet-600 transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 text-white animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 animate-slide-up">
              Why Choose Us?
            </h2>
            <p className="text-xl opacity-90 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Experience the difference with our comprehensive support solution
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white hover:bg-white/20 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-white/80">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 animate-fade-in">
            Ready to Transform Your Workplace Support?
          </h2>
          <p className="text-xl text-gray-600 mb-8 animate-slide-up">
            Join thousands of employees already using our AI-powered helpdesk solution
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-scale-in">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
