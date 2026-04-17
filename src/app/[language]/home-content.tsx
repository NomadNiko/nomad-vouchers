"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PaymentIcon from "@mui/icons-material/Payment";
import Link from "@/components/link";
import useAuth from "@/services/auth/use-auth";
import { RoleEnum } from "@/services/api/types/role";
import MuiLink from "@mui/material/Link";

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Box sx={{ color: "primary.main", mb: 1.5 }}>{icon}</Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
}

export default function HomeContent() {
  const { user, isLoaded } = useAuth();
  const isAdmin =
    !!user?.role &&
    [RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN].includes(Number(user.role.id));

  if (isLoaded && user) {
    return (
      <Container maxWidth="md" sx={{ pt: 6, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user.firstName || "there"}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          What would you like to do?
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            component={Link}
            href="/gift-cards/balance"
            size="large"
          >
            Check Balance
          </Button>
          {isAdmin && (
            <Button
              variant="outlined"
              component={Link}
              href="/admin-panel/gift-cards/purchases"
              size="large"
            >
              View Purchases
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: { xs: 6, md: 10 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <CardGiftcardIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "3rem" },
              mb: 2,
            }}
          >
            Nomad Vouchers
          </Typography>
          <Typography
            variant="h5"
            sx={{
              opacity: 0.9,
              mb: 4,
              fontSize: { xs: "1.1rem", md: "1.5rem" },
            }}
          >
            The complete gift card platform for restaurants and hospitality
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              component={Link}
              href="/gift-cards/balance"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              Check a Balance
            </Button>
            <Button
              variant="outlined"
              component={Link}
              href="/sign-in"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": { borderColor: "grey.300" },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ mb: 4, fontWeight: 600 }}
        >
          Everything you need to sell gift cards
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FeatureCard
              icon={<CardGiftcardIcon sx={{ fontSize: 40 }} />}
              title="Custom Templates"
              description="Design beautiful gift card templates with your branding, custom images, and configurable code overlays."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FeatureCard
              icon={<StorefrontIcon sx={{ fontSize: 40 }} />}
              title="Embeddable Widgets"
              description="Drop a purchase widget onto any website. Customers buy gift cards without leaving your site."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FeatureCard
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              title="Stripe & Squarespace"
              description="Accept payments through Stripe or Squarespace. Each client uses their own payment account."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FeatureCard
              icon={<DashboardIcon sx={{ fontSize: 40 }} />}
              title="Full Admin Console"
              description="Track purchases, redeem vouchers, manage users, and configure settings — all from one dashboard."
            />
          </Grid>
        </Grid>
      </Container>

      <Box
        sx={{
          bgcolor: "action.hover",
          py: { xs: 4, md: 6 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Multi-tenant by design
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            One platform, unlimited clients. Each restaurant gets their own
            isolated templates, gift cards, widgets, settings, and user
            management — all from a single deployment.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            href="/sign-in"
            size="large"
          >
            Get Started
          </Button>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 3, textAlign: "center" }}>
        <MuiLink href="/privacy-policy" color="text.secondary">
          Privacy Policy
        </MuiLink>
      </Container>
    </Box>
  );
}
