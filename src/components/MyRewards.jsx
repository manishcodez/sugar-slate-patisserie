import { Gift, Star, TrendingUp, LogIn } from 'lucide-react'
import { useLoyalty } from '../context/LoyaltyContext'
import { SectionHeading, ScrollReveal } from './ui/Animations'
import Button from './ui/Button'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function MyRewards() {
  const { points, history, pointsPer100, isLoggedIn, userName } = useLoyalty()

  return (
    <section id="rewards" className="section-padding bg-blush/50">
      <div className="section-container max-w-3xl">
        <SectionHeading
          eyebrow="Loyalty Program"
          title="My Rewards"
          subtitle={
            isLoggedIn
              ? `Welcome${userName ? `, ${userName.split(' ')[0]}` : ''}! Earn points with every order and redeem them on your next treat.`
              : 'Login to view your personal rewards balance and track your points.'
          }
        />

        {!isLoggedIn ? (
          <ScrollReveal>
            <div className="rounded-[var(--radius-lg)] border border-blush bg-cream p-8 text-center shadow-warm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-caramel/15">
                <LogIn size={28} className="text-caramel" />
              </div>
              <h3 className="font-display text-xl text-cocoa">Login to See Your Rewards</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-espresso/70">
                Rewards are linked to your account. After login, every order you place will earn points
                that only you can see and redeem.
              </p>
              <p className="mt-4 text-xs text-espresso/50">
                Use the <strong>Login</strong> or <strong>Sign Up</strong> button in the header to get started.
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <>
            <ScrollReveal>
              <div className="mb-8 rounded-[var(--radius-lg)] border border-blush bg-cream p-6 text-center shadow-warm md:p-8">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-caramel/15">
                  <Star size={24} className="text-caramel" fill="currentColor" />
                </div>
                <p className="text-sm text-espresso/60">Your Points Balance</p>
                <p className="font-display text-5xl text-cocoa">{points}</p>
                <p className="mt-2 text-sm text-espresso/70">
                  Earn {pointsPer100} point per ₹100 spent · 1 point = ₹1 off at checkout
                </p>
              </div>
            </ScrollReveal>

            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <ScrollReveal delay={0.05}>
                <div className="rounded-[var(--radius-md)] border border-blush bg-cream p-5">
                  <Gift size={20} className="mb-2 text-caramel" />
                  <h3 className="font-display text-lg text-cocoa">How to Earn</h3>
                  <p className="mt-1 text-sm text-espresso/70">
                    Complete any checkout order while logged in to earn points automatically.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <div className="rounded-[var(--radius-md)] border border-blush bg-cream p-5">
                  <TrendingUp size={20} className="mb-2 text-caramel" />
                  <h3 className="font-display text-lg text-cocoa">How to Redeem</h3>
                  <p className="mt-1 text-sm text-espresso/70">
                    At checkout, use the points slider to apply up to 50% of your order value as discount.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {history.length > 0 ? (
              <ScrollReveal delay={0.15}>
                <div className="rounded-[var(--radius-md)] border border-blush bg-cream p-5 shadow-warm">
                  <h3 className="mb-4 font-display text-lg text-cocoa">Recent Activity</h3>
                  <ul className="space-y-3">
                    {history.slice(0, 5).map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between border-b border-blush/60 pb-3 text-sm last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium text-cocoa">
                            {entry.type === 'earn' ? 'Points Earned' : 'Points Redeemed'}
                          </p>
                          <p className="text-xs text-espresso/50">{formatDate(entry.date)}</p>
                        </div>
                        <span className={`font-semibold ${entry.type === 'earn' ? 'text-sage' : 'text-caramel'}`}>
                          {entry.type === 'earn' ? '+' : '-'}{entry.points} pts
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ) : (
              <p className="text-center text-sm text-espresso/50">
                Place your first order while logged in to start earning rewards!
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
