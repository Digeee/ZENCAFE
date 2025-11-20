// About page with company story and values
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Heart, Users, Award } from "lucide-react";
import culturalImage from "@assets/generated_images/tea_picker_cultural_image.png";
import teaPlantationImage from "@assets/generated_images/ceylon_tea_plantation_hero.png";

export default function About() {
  const values = [
    {
      icon: Leaf,
      title: "Sustainability",
      description: "We work directly with family-owned estates that practice sustainable farming methods, preserving Ceylon's natural beauty for future generations.",
    },
    {
      icon: Heart,
      title: "Quality First",
      description: "Every product is carefully selected and tested to ensure it meets our high standards for flavor, aroma, and authenticity.",
    },
    {
      icon: Users,
      title: "Fair Trade",
      description: "We believe in fair compensation for farmers and workers, building long-term relationships that benefit entire communities.",
    },
    {
      icon: Award,
      title: "Heritage",
      description: "Honoring centuries-old traditions while embracing modern techniques to bring you the finest Ceylon coffee and tea.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${teaPlantationImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/70" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-serif text-5xl md:text-6xl font-medium text-white mb-4" data-testid="about-title">
            Our Story
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Bringing the finest Ceylon coffee and tea to the world
          </p>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-4xl font-medium" data-testid="section-heritage-title">
                A Legacy of Excellence
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  For over a century, Sri Lanka's misty highlands have been renowned for producing some of the world's finest tea. Known as Ceylon tea, it's celebrated globally for its exceptional quality, distinctive flavor profiles, and rich heritage.
                </p>
                <p>
                  ZEN CAFE was founded on a simple belief: everyone deserves to experience the authentic taste of Ceylon. We've built direct relationships with family-owned estates across Sri Lanka's tea and coffee-growing regions, ensuring that every product we offer is traceable, sustainable, and of the highest quality.
                </p>
                <p>
                  Our journey began with a passion for sharing Sri Lanka's agricultural treasures with the world. Today, we're proud to offer a carefully curated selection that honors tradition while meeting modern standards of excellence and sustainability.
                </p>
              </div>
            </div>
            <div className="relative h-[500px] rounded-xl overflow-hidden">
              <img
                src={culturalImage}
                alt="Traditional tea picking in Ceylon"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-serif text-4xl font-medium" data-testid="section-values-title">
              What We Stand For
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our values guide every decision we make, from sourcing to serving
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center" data-testid={`value-card-${index}`}>
                <CardContent className="p-6 space-y-4">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-medium">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="font-serif text-4xl md:text-5xl font-medium">
            Experience Ceylon's Finest
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover our collection of premium coffee, tea, and artisanal pastries, carefully selected from Sri Lanka's best estates and producers.
          </p>
        </div>
      </section>
    </div>
  );
}
