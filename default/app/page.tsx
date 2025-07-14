import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Search, User, Menu } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-[#1E40AF]">asdf</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-[#3B82F6] transition-colors">
                  New Arrivals
                </a>
                <a href="#" className="text-gray-600 hover:text-[#3B82F6] transition-colors">
                  Women
                </a>
                <a href="#" className="text-gray-600 hover:text-[#3B82F6] transition-colors">
                  Men
                </a>
                <a href="#" className="text-gray-600 hover:text-[#3B82F6] transition-colors">
                  Accessories
                </a>
                <a href="#" className="text-gray-600 hover:text-[#3B82F6] transition-colors">
                  Sale
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#3B82F6]">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#3B82F6]">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#3B82F6]">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#3B82F6] relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#3B82F6]">
                  2
                </Badge>
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl font-light text-gray-900 leading-tight">
                Discover Your
                <span className="block text-[#3B82F6] font-normal">Perfect Style</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Curated fashion pieces that define your unique aesthetic. Modern designs for the contemporary lifestyle.
              </p>
              <div className="flex space-x-4">
                <Button className="bg-[#3B82F6] hover:bg-[#1E40AF] text-white px-8 py-3 text-lg">
                  Shop Collection
                </Button>
                <Button
                  variant="outline"
                  className="border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white px-8 py-3 text-lg bg-transparent"
                >
                  View Lookbook
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=600&width=500"
                alt="Fashion Model"
                width={500}
                height={600}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-light text-gray-900 mb-4">Featured Collection</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handpicked pieces that embody modern elegance and timeless appeal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Minimalist Blazer",
                price: "$189",
                originalPrice: "$249",
                image: "/placeholder.svg?height=400&width=300",
                badge: "New",
              },
              {
                name: "Essential Turtleneck",
                price: "$79",
                originalPrice: null,
                image: "/placeholder.svg?height=400&width=300",
                badge: null,
              },
              {
                name: "Tailored Trousers",
                price: "$129",
                originalPrice: "$159",
                image: "/placeholder.svg?height=400&width=300",
                badge: "Sale",
              },
              {
                name: "Silk Scarf",
                price: "$45",
                originalPrice: null,
                image: "/placeholder.svg?height=400&width=300",
                badge: "Trending",
              },
            ].map((product, index) => (
              <Card
                key={index}
                className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={400}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.badge && (
                      <Badge
                        className={`absolute top-3 left-3 ${
                          product.badge === "Sale"
                            ? "bg-red-500"
                            : product.badge === "New"
                              ? "bg-[#3B82F6]"
                              : "bg-green-500"
                        }`}
                      >
                        {product.badge}
                      </Badge>
                    )}
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-[#1E40AF]">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">(24)</span>
                    </div>
                    <Button className="w-full mt-3 bg-[#3B82F6] hover:bg-[#1E40AF] text-white">Add to Cart</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#3B82F6] rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-medium text-gray-900">Free Shipping</h4>
              <p className="text-gray-600">asdf</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#3B82F6] rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-medium text-gray-900">Quality Guarantee</h4>
              <p className="text-gray-600">Premium materials and craftsmanship in every piece</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#3B82F6] rounded-full flex items-center justify-center mx-auto">
                <User className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-medium text-gray-900">Personal Styling</h4>
              <p className="text-gray-600">Expert styling advice for your perfect look</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-[#1E40AF]">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-light text-white mb-4">Stay in Style</h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to get the latest fashion trends, exclusive offers, and styling tips delivered to your inbox
          </p>
          <div className="flex max-w-md mx-auto space-x-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <Button className="bg-[#3B82F6] hover:bg-blue-500 text-white px-8 py-3">Subscribe</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-[#1E40AF]">asdf</h4>
              <p className="text-gray-600">
                Modern fashion for the contemporary lifestyle. Discover your perfect style with our curated collections.
              </p>
              <div className="text-sm text-gray-500">
                <p>Secure payments powered by</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="bg-[#3B82F6] text-white px-3 py-1 rounded text-xs font-medium">PayPal</div>
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-4">Shop</h5>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    Women
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    Men
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    Accessories
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    Sale
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-4">Support</h5>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    Size Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-4">Company</h5>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3B82F6] transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; 2024 asdf. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
