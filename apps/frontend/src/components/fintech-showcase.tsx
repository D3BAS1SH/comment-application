'use client';
import { FintechButton } from './fintech-button';
import {
  FintechCard,
  FintechCardContent,
  FintechCardDescription,
  FintechCardHeader,
  FintechCardTitle,
} from './fintech-card';
import { FintechInput } from './fintech-input';
import { FintechForm, FintechFormField } from './fintech-form';
import { ArrowRight, CreditCard, Lock, Mail, User } from 'lucide-react';

export default function FintechShowcase() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tighter mb-4">
            Fintech Component Showcase
          </h1>
          <p className="text-gray-400 text-lg">
            Custom components inspired by the fintech landing page design
          </p>
        </div>

        {/* Buttons Section */}
        <section>
          <h2 className="text-2xl font-bold tracking-tighter mb-8">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FintechButton variant="primary">
              Primary Button
              <ArrowRight size={16} />
            </FintechButton>
            <FintechButton variant="secondary">Secondary Button</FintechButton>
            <FintechButton variant="outline">Outline Button</FintechButton>
            <FintechButton variant="ghost">Ghost Button</FintechButton>
          </div>

          <div className="mt-6 flex gap-4">
            <FintechButton size="sm">Small</FintechButton>
            <FintechButton size="md">Medium</FintechButton>
            <FintechButton size="lg">Large</FintechButton>
          </div>
        </section>

        {/* Cards Section */}
        <section>
          <h2 className="text-2xl font-bold tracking-tighter mb-8">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FintechCard variant="default">
              <FintechCardHeader>
                <CreditCard className="h-8 w-8 text-cyan-400 mb-4" />
                <FintechCardTitle>Default Card</FintechCardTitle>
              </FintechCardHeader>
              <FintechCardContent>
                <FintechCardDescription>
                  This is a default card with glass morphism effects and subtle
                  borders.
                </FintechCardDescription>
              </FintechCardContent>
            </FintechCard>

            <FintechCard variant="gradient">
              <FintechCardHeader>
                <Lock className="h-8 w-8 text-violet-400 mb-4" />
                <FintechCardTitle>Gradient Card</FintechCardTitle>
              </FintechCardHeader>
              <FintechCardContent>
                <FintechCardDescription>
                  This card features a subtle gradient background with enhanced
                  visual appeal.
                </FintechCardDescription>
              </FintechCardContent>
            </FintechCard>

            <FintechCard variant="hover-glow">
              <FintechCardHeader>
                <Mail className="h-8 w-8 text-cyan-400 mb-4" />
                <FintechCardTitle>Hover Glow Card</FintechCardTitle>
              </FintechCardHeader>
              <FintechCardContent>
                <FintechCardDescription>
                  Hover over this card to see the beautiful glow effect and
                  border animation.
                </FintechCardDescription>
              </FintechCardContent>
            </FintechCard>
          </div>
        </section>

        {/* Inputs Section */}
        <section>
          <h2 className="text-2xl font-bold tracking-tighter mb-8">
            Input Fields
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <FintechInput
                label="Default Input"
                placeholder="Enter your email"
                type="email"
              />

              <FintechInput
                label="Input with Icon"
                placeholder="Enter your email"
                type="email"
                icon={<Mail size={18} />}
              />

              <FintechInput
                label="Password Input"
                placeholder="Enter your password"
                type="password"
              />

              <FintechInput
                label="Input with Error"
                placeholder="Enter your email"
                type="email"
                error="Please enter a valid email address"
              />
            </div>

            <div className="space-y-6">
              <FintechInput
                variant="floating"
                label="Floating Label"
                placeholder="floating"
                type="text"
              />

              <FintechInput
                variant="minimal"
                label="Minimal Input"
                placeholder="Enter text"
                type="text"
              />

              <FintechInput
                variant="minimal"
                placeholder="Search..."
                type="search"
                icon={<User size={18} />}
              />
            </div>
          </div>
        </section>

        {/* Forms Section */}
        <section>
          <h2 className="text-2xl font-bold tracking-tighter mb-8">Forms</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Card Form */}
            <FintechForm
              title="Sign Up"
              subtitle="Create your fintech account"
              variant="card"
            >
              <FintechFormField>
                <FintechInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  icon={<User size={18} />}
                />
              </FintechFormField>

              <FintechFormField>
                <FintechInput
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  icon={<Mail size={18} />}
                />
              </FintechFormField>

              <FintechFormField>
                <FintechInput
                  label="Password"
                  placeholder="Create a password"
                  type="password"
                />
              </FintechFormField>

              <FintechButton variant="primary" className="w-full">
                Create Account
                <ArrowRight size={16} />
              </FintechButton>
            </FintechForm>

            {/* Glass Form */}
            <FintechForm
              title="Contact Us"
              subtitle="Get in touch with our team"
              variant="glass"
            >
              <FintechFormField>
                <FintechInput
                  variant="floating"
                  label="Your Name"
                  placeholder="name"
                />
              </FintechFormField>

              <FintechFormField>
                <FintechInput
                  variant="floating"
                  label="Email Address"
                  placeholder="email"
                  type="email"
                />
              </FintechFormField>

              <FintechFormField>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 min-h-[100px] resize-none"
                  placeholder="Your message..."
                />
              </FintechFormField>

              <FintechButton variant="primary" className="w-full">
                Send Message
              </FintechButton>
            </FintechForm>
          </div>
        </section>
      </div>
    </div>
  );
}
