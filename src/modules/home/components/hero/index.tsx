import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="w-full bg-gradient-to-br from-turquoise-50 via-white to-sand-100 border-b border-ui-border-base">
      <div className="content-container py-24 small:py-36 flex flex-col items-center text-center gap-8">
        <div className="flex flex-col gap-4 max-w-2xl">
          <h1 className="font-serif text-4xl small:text-5xl leading-tight text-brand-text font-medium">
            Wholistic Health, Naturally
          </h1>
          <p className="text-lg small:text-xl text-brand-text-secondary leading-relaxed">
            Discover handpicked herbal remedies, premium supplements, and
            wellness essentials crafted to nourish your body, mind, and spirit.
          </p>
        </div>
        <div className="flex gap-4 mt-2">
          <LocalizedClientLink
            href="/store"
            className="px-8 py-3 bg-turquoise-400 text-white rounded-full hover:bg-turquoise-500 transition-colors duration-200 font-medium"
          >
            Shop Now
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/store"
            className="px-8 py-3 border border-turquoise-400 text-turquoise-500 rounded-full hover:bg-turquoise-50 transition-colors duration-200 font-medium"
          >
            Browse Categories
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default Hero
