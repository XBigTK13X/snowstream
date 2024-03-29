package com.simplepathstudios.snowstream;

import android.annotation.SuppressLint;
import android.app.Activity;
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

public class TvActivity extends Activity {
    private final String TAG = "TVActivity";

    private static TvActivity __instance;

    public static TvActivity getInstance() {
        return __instance;
    }

    private NavController navController;
    private LinearLayout mainLayout;
    private NavDestination currentLocation;

    private SettingsViewModel settingsViewModel;

    public void navigateUp() {
        navController.navigateUp();
    }

    public boolean isCurrentLocation(String locationName) {
        return currentLocation.getLabel().equals(locationName);
    }

    @SuppressLint("ClickableViewAccessibility")
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        __instance = this;
        Util.setGlobalContext(this);

        Util.registerGlobalExceptionHandler();

        this.settingsViewModel = new ViewModelProvider(MobileActivity.getInstance()).get(SettingsViewModel.class);
        this.settingsViewModel.initialize(this.getSharedPreferences("Snowstream", Context.MODE_PRIVATE));
        SettingsViewModel.Settings settings = settingsViewModel.Data.getValue();
        ApiClient.retarget(settings.ServerUrl, settings.Username, settings.AuthToken);

        setContentView(R.layout.app_tv);

        mainLayout = findViewById(R.id.main_activity_layout);

        Util.enableFullscreen();

        if (SnowstreamSettings.DebugResourceLeaks) {
            StrictMode.setVmPolicy(new StrictMode.VmPolicy.Builder(StrictMode.getVmPolicy())
                    .detectLeakedClosableObjects()
                    .build());
        }
        Util.log(TAG, "====== Starting new TV app instance ======");

        navController = Navigation.findNavController(this, R.id.nav_host_fragment);

        navController.addOnDestinationChangedListener(new NavController.OnDestinationChangedListener() {
            @Override
            public void onDestinationChanged(@NonNull NavController controller, @NonNull NavDestination destination, @Nullable Bundle arguments) {
                CharSequence name = destination.getLabel();
                currentLocation = destination;
                String label = name.toString();
                if (!label.equals("Login") && !label.equals("Authenticate")) {
                    if (settingsViewModel.Data.getValue().AuthToken == null) {
                        controller.navigate(R.id.login_fragment);
                    }
                }
            }
        });

        mainLayout.setVisibility(View.VISIBLE);
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
