package com.simplepathstudios.snowstream;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.StrictMode;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.NavDestination;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;

import com.google.android.material.navigation.NavigationView;
import com.simplepathstudios.snowstream.api.ApiClient;
import com.simplepathstudios.snowstream.viewmodel.SettingsViewModel;

public class MobileActivity extends AppCompatActivity {

    private final String TAG = "MobileActivity";

    private NavController navController;
    private NavigationView navigationView;
    private LinearLayout mainLayout;

    private SettingsViewModel settingsViewModel;

    private Toolbar toolbar;
    private DrawerLayout drawerLayout;
    private ProgressBar loadingProgress;
    private TextView loadingText;



    @SuppressLint("ClickableViewAccessibility")
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Util.initApp(this);

        this.settingsViewModel = Util.getApp().getViewModel(SettingsViewModel.class);
        this.settingsViewModel.initialize(this.getSharedPreferences("Snowstream", Context.MODE_PRIVATE));
        SettingsViewModel.Settings settings = settingsViewModel.Data.getValue();
        ApiClient.retarget(settings.ServerUrl, settings.Username, settings.AuthToken);

        setContentView(R.layout.app_mobile);

        LoadingIndicator.setLoading(false);

        Util.enableFullscreen();

        if(SnowstreamSettings.DebugResourceLeaks) {
            StrictMode.setVmPolicy(new StrictMode.VmPolicy.Builder(StrictMode.getVmPolicy())
                    .detectLeakedClosableObjects()
                    .build());
        }
        Util.log(TAG, "====== Starting new Mobile app instance ======");

        toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        loadingProgress = findViewById(R.id.loading_indicator);
        LoadingIndicator.setProgressBar(loadingProgress);
        loadingText = findViewById(R.id.loading_message);
        LoadingIndicator.setLoadingTextView(loadingText);

        drawerLayout = findViewById(R.id.main_activity_drawer);
        mainLayout = findViewById(R.id.main_activity_layout);
        navigationView = findViewById(R.id.nav_view);
        navController = Navigation.findNavController(this, R.id.nav_host_fragment);
        // Pages that show full nav, not just the back button
        AppBarConfiguration appBarConfiguration = new AppBarConfiguration.Builder(
                R.id.authenticate_fragment,
                R.id.login_fragment,
                R.id.home_fragment,
                R.id.options_fragment)
                .setDrawerLayout(drawerLayout)
                .build();
        navController.addOnDestinationChangedListener(new NavController.OnDestinationChangedListener() {
            @Override
            public void onDestinationChanged(@NonNull NavController controller, @NonNull NavDestination destination, @Nullable Bundle arguments) {
                getSupportActionBar().setSubtitle("");
                CharSequence name = destination.getLabel();
                String label = name.toString();
                if(!label.equals("Login") && !label.equals("Authenticate")){
                    if(settingsViewModel.Data.getValue().AuthToken == null){
                        controller.navigate(R.id.login_fragment);
                    }
                }
                getSupportActionBar().setTitle(name);
            }
        });
        NavigationUI.setupWithNavController(toolbar, navController, appBarConfiguration);
        NavigationUI.setupWithNavController(navigationView, navController);
        navigationView.setNavigationItemSelectedListener(new NavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem menuItem) {
                Util.getApp().navigateTo(menuItem.getItemId());
                drawerLayout.closeDrawer(GravityCompat.START);
                return true;
            }
        });

        mainLayout.setVisibility(View.VISIBLE);
        navigationView.setVisibility(View.VISIBLE);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        return true;
    }

    @Override
    public void onResume() {
        super.onResume();
        Intent intent = getIntent();
        Util.log(TAG, "Resuming with intent " + intent.getAction());
        Util.enableFullscreen();
    }

    @Override
    public void onPause() {
        super.onPause();
        Util.log(TAG, "Pausing");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Util.log(TAG, "Destroying");
    }
}