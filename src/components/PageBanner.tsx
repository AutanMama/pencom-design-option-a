import { motion } from "framer-motion";
import { Link } from "react-router";
import type { ReactNode } from "react";

interface PageBannerProps {
  label: string;
  title: string;
  description: string;
  bgImage?: string;
  children?: ReactNode;
  /** Name of this page in the "you are here" trail (defaults to the label) */
  crumb?: string;
}

export default function PageBanner({ label, title, description, bgImage, children, crumb }: PageBannerProps) {
  return (
    <div className="relative">
      {/* Background image layer */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}
      {/* Dark green overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#234504]/95 via-[#326206]/90 to-[#4C7F1E]/85" />
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* "You are here" trail (GOV.UK breadcrumbs) in place of the old label.
              Brighter gold so it passes the WCAG 4.5:1 contrast on the green. */}
          <motion.nav
            aria-label="Breadcrumb"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ol className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#EDC277] uppercase tracking-wider">
              <li className="flex items-center gap-2">
                <span className="w-8 h-0.5 bg-[#EDC277] rounded-full" aria-hidden="true" />
                <Link to="/" className="underline-offset-4 hover:underline">Home</Link>
              </li>
              <li aria-hidden="true" className="opacity-70">›</li>
              <li aria-current="page">{crumb ?? label}</li>
            </ol>
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-4xl font-bold text-white mt-2"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-white/80 mt-3 max-w-xl"
          >
            {description}
          </motion.p>
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-4"
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
